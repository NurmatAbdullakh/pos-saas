import { ArrowRight, Store, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const sections = [
  {
    path: "stores",
    title: "Stores & locations",
    description: "Create and manage branches that belong to this business.",
    action: "Manage stores",
    icon: Store,
  },
  {
    path: "members",
    title: "Team members",
    description: "Add employees to this business and assign manager or cashier access.",
    action: "Manage team",
    icon: Users,
  },
];

export function BusinessWorkspaceHome() {
  const { businessId = "" } = useParams<{ businessId: string }>();

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">Business setup</h2>
        <p className="mt-1 text-sm text-slate-500">Start by adding at least one store, then invite the people who will work in this business.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map(({ path, title, description, action, icon: Icon }) => (
          <Link
            key={path}
            to={`/businesses/${businessId}/${path}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Icon className="size-5" />
            </div>
            <h3 className="mt-5 font-display text-lg font-bold text-slate-950">{title}</h3>
            <p className="mt-1 min-h-10 text-sm leading-6 text-slate-500">{description}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
              {action}
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
