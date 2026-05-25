export function getProductNamePriceError(name: string, price: number): string | null {
    if (!name.trim()) {
        return 'Product name is required.';
    }
    if (!Number.isFinite(price) || price <= 0) {
        return 'Price is required and must be greater than 0.';
    }
    return null;
}

export function validateProductForm(
    form: HTMLFormElement,
    name: string,
    price: number,
): boolean {
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }

    const error = getProductNamePriceError(name, price);
    if (error) {
        alert(error);
        return false;
    }

    return true;
}
