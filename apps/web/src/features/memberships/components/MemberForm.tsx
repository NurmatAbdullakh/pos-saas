import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { membershipSchema, type MembershipFormValues } from "../schemas/membership.schema";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { FormField } from "../../../shared/components/ui/form-field";

interface MemberFormProps {
  isPending: boolean;
  onSubmit: (values: MembershipFormValues) => Promise<void>;
  onCancel: () => void;
  error?: string;
}

export function MemberForm({ isPending, onSubmit, onCancel, error }: MemberFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: { name: "", email: "", password: "", role: "cashier" },
  });

  return (
    <form id="member-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Full name" htmlFor="member-name" error={errors.name?.message}>
        <Input id="member-name" autoFocus placeholder="e.g. Alex Johnson" autoComplete="name" {...register("name")} />
      </FormField>
      <FormField label="Email address" htmlFor="member-email" error={errors.email?.message}>
        <Input id="member-email" type="email" placeholder="name@company.com" autoComplete="email" {...register("email")} />
      </FormField>
      <FormField label="Temporary password" htmlFor="member-password" error={errors.password?.message} hint="At least 12 characters. Share it securely with the new team member.">
        <Input id="member-password" type="password" autoComplete="new-password" placeholder="Create a temporary password" {...register("password")} />
      </FormField>
      <FormField label="Access role" htmlFor="member-role" hint="You can change this role later.">
        <select id="member-role" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10" {...register("role")}>
          <option value="cashier">Cashier — sales and products</option>
          <option value="manager">Manager — stores, products and team view</option>
        </select>
      </FormField>
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending}>{isPending ? "Adding…" : "Add team member"}</Button>
      </div>
    </form>
  );
}
