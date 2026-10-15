
import { z } from "zod";

// EXPERIMENT: описываем правила проверки входящих данных.
// Zod будет проверять реальные данные во время выполнения программы.
export const createProductSchema = z.object({
  // Название: строка, без пробелов по краям, от 1 до 100 символов.
  name: z.string().trim().min(1).max(100),

  // Цена: положительное целое число.
  price: z.number().int().positive(),

  // Если поле отсутствует, Zod подставит true.
  isAvailable: z.boolean().default(true),
});


// Выводим TypeScript-тип на основе Zod-схемы.
// Тип автоматически соответствует правилам схемы.
export type ProductInput = z.infer<
  typeof createProductSchema
>;