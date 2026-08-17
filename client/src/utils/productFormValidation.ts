export function getProductNamePriceError(
    name: string,
    price: number,
    discountPrice?: number | null,
): string | null {
    if (!name.trim()) {
        return 'Product name is required.';
    }
    if (!Number.isFinite(price) || price <= 0) {
        return 'Price is required and must be greater than 0.';
    }
    if (discountPrice !== undefined && discountPrice !== null) {
        if (!Number.isFinite(discountPrice) || discountPrice <= 0) {
            return 'Discounted price must be greater than 0, or left empty.';
        }
        if (discountPrice >= price) {
            return 'Discounted price must be lower than the original price.';
        }
    }
    return null;
}

export function validateProductForm(
    form: HTMLFormElement,
    name: string,
    price: number,
    discountPrice?: number | null,
): boolean {
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }

    const error = getProductNamePriceError(name, price, discountPrice);
    if (error) {
        alert(error);
        return false;
    }

    return true;
}
