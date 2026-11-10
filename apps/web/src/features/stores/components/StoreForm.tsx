import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storeSchema, type StoreFormValues } from "../schemas/store.schema";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { FormField } from "../../../shared/components/ui/form-field";

interface StoreFormProps {
  initialName?: string;
  isPending: boolean;
  onSubmit: (values: StoreFormValues) => Promise<void>;
  onCancel: () => void;
  error?: string;
}

export function StoreForm({ initialName = "", isPending, onSubmit, onCancel, error }: StoreFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: { name: initialName },
  });

  return (
    <form id="store-form" className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Store name" htmlFor="store-name" error={errors.name?.message} hint="For example, Main branch or Chilonzor.">
        <Input id="store-name" autoFocus placeholder="Enter store name" maxLength={150} {...register("name")} />
      </FormField>
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save store"}</Button>
      </div>
    </form>
  );
}
