import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessSchema, type BusinessFormValues } from "../schemas/business.schema";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { FormField } from "../../../shared/components/ui/form-field";

interface BusinessFormProps {
  initialName?: string;
  isPending: boolean;
  onSubmit: (values: BusinessFormValues) => Promise<void>;
  onCancel: () => void;
  error?: string;
}

export function BusinessForm({ initialName = "", isPending, onSubmit, onCancel, error }: BusinessFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: { name: initialName },
  });

  useEffect(() => reset({ name: initialName }), [initialName, reset]);

  return (
    <form id="business-form" className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Business name" htmlFor="business-name" error={errors.name?.message} hint="Use the name your team recognizes.">
        <Input id="business-name" autoFocus placeholder="e.g. Sahro Ice Cream" maxLength={150} {...register("name")} />
      </FormField>
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save business"}</Button>
      </div>
    </form>
  );
}
