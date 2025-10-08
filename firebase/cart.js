import { ref, onValue, set, update, remove, get } from "firebase/database";
import { db } from "./config";


export function listenToCart(userId, callback) {
  if (!userId) return () => {};
  const cartRef = ref(db, `carts/${userId}/items`);
  const unsub = onValue(cartRef, (snapshot) => {
    const val = snapshot.val() || {};
    callback(val);
  });

  return () => unsub();
}

export async function addToCart(userId, product, qty = 1) {
  if (!userId || !product || !product.id) throw new Error("Invalid params");
  const itemRef = ref(db, `carts/${userId}/items/${product.id}`);


  const sanitized = {
    id: product.id,
    title: product.title,
    price:
      typeof product.price === "number"
        ? product.price
        : product.price != null
        ? Number(product.price)
        : null,
    image: product.image || null,
    category: product.category || "",
  };

  const hasIncomingRequired =
    sanitized.title && sanitized.image && sanitized.price != null;

  const snap = await get(itemRef);
  if (snap.exists()) {
    const existing = snap.val();
    const existingQty = existing.quantity || 0;
    const existingProduct = existing.product || {};
    const hasExistingRequired =
      existingProduct.title &&
      existingProduct.image &&
      existingProduct.price != null;

    if (hasExistingRequired) {
      await set(itemRef, {
        quantity: existingQty + qty,
        product: existingProduct,
      });
    } else if (hasIncomingRequired) {
      await set(itemRef, {
        quantity: existingQty + qty,
        product: sanitized,
      });
    } else {
     
      console.warn(
        "addToCart: missing required product fields and no existing rich product to preserve",
        {
          product,
          existingProduct,
        }
      );
      throw new Error("Product data incomplete; cannot add to cart.");
    }
  } else {
    
    if (!hasIncomingRequired) {
      console.warn(
        "addToCart: incoming product missing required fields, refusing to add",
        { product }
      );
      throw new Error("Product data incomplete; cannot add to cart.");
    }
    await set(itemRef, { quantity: qty, product: sanitized });
  }
}

export async function updateCartItem(userId, productId, quantity) {
  if (!userId || !productId) throw new Error("Invalid params");
  const itemRef = ref(db, `carts/${userId}/items/${productId}`);
  if (quantity <= 0) {
    await remove(itemRef);
  } else {
    await update(itemRef, { quantity });
  }
}

export async function removeCartItem(userId, productId) {
  if (!userId || !productId) throw new Error("Invalid params");
  const itemRef = ref(db, `carts/${userId}/items/${productId}`);
  await remove(itemRef);
}
