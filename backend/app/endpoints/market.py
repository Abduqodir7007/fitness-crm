import os
import uuid
import aiofiles
import logging

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..logging_config import setup_logging
from ..dependancy import is_admin, get_gym_id
from ..database import get_db
from ..models import Products, ProductSales, Gyms
from ..schemas.products import (
    ProductResponse,
    ProductSellRequest,
    ProductSaleResponse,
    MarketplaceStatusResponse,
)

setup_logging()
logger = logging.getLogger("market_file")
logger.propagate = True

router = APIRouter(prefix="/market", tags=["Market"], dependencies=[Depends(is_admin)])

# Directory for storing product images
UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "uploads", "products"
)
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def check_marketplace_enabled(gym_id: str, db: AsyncSession):
    """Check if marketplace is enabled for the gym"""
    result = await db.execute(select(Gyms).where(Gyms.id == gym_id))
    gym = result.scalars().first()
    if not gym:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Zal topilmadi"
        )
    if not gym.marketplace_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Marketplace bu zal uchun yoqilmagan",
        )
    return True


@router.get("/status", response_model=MarketplaceStatusResponse)
async def get_marketplace_status(
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):
    """Get marketplace enabled status for the gym"""
    logger.info("Checking marketplace status for gym_id=%s", gym_id)
    result = await db.execute(select(Gyms).where(Gyms.id == gym_id))
    gym = result.scalars().first()
    if not gym:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Zal topilmadi"
        )
    return {"marketplace_enabled": gym.marketplace_enabled}


@router.get("/products", response_model=list[ProductResponse])
async def get_products(
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):
    """Get all products for the gym"""
    logger.info("Fetching products for gym_id=%s", gym_id)
    await check_marketplace_enabled(gym_id, db)

    result = await db.execute(
        select(Products)
        .where(Products.gym_id == gym_id)
        .order_by(Products.created_at.desc())
    )
    products = result.scalars().all()
    logger.info("Fetched %d products for gym_id=%s", len(products), gym_id)
    return products


@router.post(
    "/products", status_code=status.HTTP_201_CREATED, response_model=ProductResponse
)
async def create_product(
    name: str = Form(...),
    selling_price: int = Form(...),
    purchase_price: int = Form(...),
    total_amount: int = Form(...),
    supplier_name: str = Form(None),
    image: UploadFile = File(None),
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new product with optional image upload"""
    logger.info("Creating product: name=%s, gym_id=%s", name, gym_id)
    await check_marketplace_enabled(gym_id, db)

    image_path = None
    if image and image.filename:
        # Generate unique filename
        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Save the file
        content = await image.read()
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)

        image_path = f"/uploads/products/{unique_filename}"
        logger.info("Image saved: %s", image_path)

    new_product = Products(
        name=name,
        image_path=image_path,
        selling_price=selling_price,
        purchase_price=purchase_price,
        total_amount=total_amount,
        current_amount=total_amount,  # Initially, current equals total
        supplier_name=supplier_name,
        gym_id=gym_id,
    )

    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)

    logger.info("Product created successfully: id=%s", new_product.id)
    return new_product


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    name: str = Form(None),
    selling_price: int = Form(None),
    purchase_price: int = Form(None),
    total_amount: int = Form(None),
    current_amount: int = Form(None),
    supplier_name: str = Form(None),
    image: UploadFile = File(None),
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing product"""
    logger.info("Updating product: product_id=%s, gym_id=%s", product_id, gym_id)
    await check_marketplace_enabled(gym_id, db)

    result = await db.execute(
        select(Products).where(Products.id == product_id, Products.gym_id == gym_id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mahsulot topilmadi"
        )

    # Update fields if provided
    if name is not None:
        product.name = name
    if selling_price is not None:
        product.selling_price = selling_price
    if purchase_price is not None:
        product.purchase_price = purchase_price
    if total_amount is not None:
        product.total_amount = total_amount
    if current_amount is not None:
        product.current_amount = current_amount
    if supplier_name is not None:
        product.supplier_name = supplier_name

    # Handle image upload
    if image and image.filename:
        # Delete old image if exists
        if product.image_path:
            old_file_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                product.image_path.lstrip("/"),
            )
            if os.path.exists(old_file_path):
                os.remove(old_file_path)

        # Save new image
        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        content = await image.read()
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)

        product.image_path = f"/uploads/products/{unique_filename}"

    await db.commit()
    await db.refresh(product)

    logger.info("Product updated successfully: id=%s", product.id)
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_200_OK)
async def delete_product(
    product_id: str,
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a product"""
    logger.info("Deleting product: product_id=%s, gym_id=%s", product_id, gym_id)
    await check_marketplace_enabled(gym_id, db)

    result = await db.execute(
        select(Products).where(Products.id == product_id, Products.gym_id == gym_id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mahsulot topilmadi"
        )

    # Delete image file if exists
    if product.image_path:
        old_file_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), product.image_path.lstrip("/")
        )
        if os.path.exists(old_file_path):
            os.remove(old_file_path)

    await db.delete(product)
    await db.commit()

    logger.info("Product deleted successfully: id=%s", product_id)
    return {"message": "Mahsulot muvaffaqiyatli o'chirildi"}


@router.post("/products/sell", status_code=status.HTTP_201_CREATED)
async def sell_product(
    sale: ProductSellRequest,
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):
    """Sell a product - subtract from current amount"""
    logger.info(
        "Selling product: product_id=%s, quantity=%s, gym_id=%s",
        sale.product_id,
        sale.quantity,
        gym_id,
    )
    await check_marketplace_enabled(gym_id, db)

    result = await db.execute(
        select(Products).where(
            Products.id == sale.product_id, Products.gym_id == gym_id
        )
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mahsulot topilmadi"
        )

    if product.current_amount < sale.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Yetarli mahsulot yo'q. Mavjud: {product.current_amount}",
        )

    total_price = product.selling_price * sale.quantity

    # Create sale record
    new_sale = ProductSales(
        product_id=product.id,
        quantity=sale.quantity,
        total_price=total_price,
        payment_method=sale.payment_method.value,
        gym_id=gym_id,
    )

    # Subtract from current amount
    product.current_amount -= sale.quantity

    db.add(new_sale)
    await db.commit()
    await db.refresh(new_sale)

    logger.info(
        "Product sold successfully: sale_id=%s, quantity=%s, total_price=%s",
        new_sale.id,
        sale.quantity,
        total_price,
    )

    return {
        "message": "Mahsulot muvaffaqiyatli sotildi",
        "sale_id": str(new_sale.id),
        "total_price": total_price,
        "remaining_amount": product.current_amount,
    }


# not used
@router.get("/sales", response_model=list[ProductSaleResponse])
async def get_sales(
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):
    """Get all sales for the gym"""
    logger.info("Fetching sales for gym_id=%s", gym_id)
    await check_marketplace_enabled(gym_id, db)

    result = await db.execute(
        select(ProductSales, Products.name)
        .join(Products, ProductSales.product_id == Products.id)
        .where(ProductSales.gym_id == gym_id)
        .order_by(ProductSales.sale_date.desc())
    )
    rows = result.all()

    sales = []
    for sale, product_name in rows:
        sales.append(
            {
                "id": sale.id,
                "quantity": sale.quantity,
                "total_price": sale.total_price,
                "sale_date": sale.sale_date,
                "payment_method": sale.payment_method,
                "product_name": product_name,
            }
        )

    logger.info("Fetched %d sales for gym_id=%s", len(sales), gym_id)
    return sales


@router.post("/products/{product_id}/restock", response_model=ProductResponse)
async def restock_product(
    product_id: str,
    amount: int,
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):
    """Add more stock to a product"""
    logger.info(
        "Restocking product: product_id=%s, amount=%s, gym_id=%s",
        product_id,
        amount,
        gym_id,
    )
    await check_marketplace_enabled(gym_id, db)

    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Miqdor 0 dan katta bo'lishi kerak",
        )

    result = await db.execute(
        select(Products).where(Products.id == product_id, Products.gym_id == gym_id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mahsulot topilmadi"
        )

    product.total_amount += amount
    product.current_amount += amount

    await db.commit()
    await db.refresh(product)

    logger.info(
        "Product restocked successfully: id=%s, new_total=%s, new_current=%s",
        product.id,
        product.total_amount,
        product.current_amount,
    )
    return product
