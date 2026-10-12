
import { productRepository } from "./product.repository.js";
import { createProductService } from "./product.service.js";

// Composition Root: соединяем конкретный репозиторий
// с сервисом в одном месте.
export const productService = createProductService(productRepository);