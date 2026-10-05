import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { AmbientBackground, Button, SearchField, Sidebar, TopBar } from "@/design-system/companion-library-764952";

export const Route = createFileRoute("/_app")({ component: AppShell });

const titles: Record<string, string> = {
  "/": "Dashboard", "/customers": "Customers", "/vehicles": "Vehicles", "/slots": "Parking Slots",
  "/sessions": "Parking Sessions", "/bills": "Bills", "/payments": "Payments",
};

function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    const syncTheme = (event: StorageEvent) => {
      if (event.key !== "parksmart-theme" && event.key !== null) return;
      const next = event.newValue === "dark" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("parksmart-theme", next);
    } catch {
      // The selection remains usable when storage is unavailable.
    }
  }

  const sidebar = (
    <Sidebar
      activeHref={pathname}
      renderLink={(item, props) => <Link to={item.href as "/"} onClick={() => setOpen(false)} {...props} />}
      footer={
        <Button variant="ghost" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} onClick={toggleTheme}>
          {theme === "light" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          {theme === "light" ? "Light mode" : "Dark mode"}
        </Button>
      }
    />
  );

  return (
    <div className="relative flex min-h-screen bg-canvas font-sans text-ink">
      <AmbientBackground />
      <div className="relative hidden lg:flex">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="relative z-10 flex">{sidebar}</div>
          <button aria-label="Close menu" className="flex-1 bg-ink/30" onClick={() => setOpen(false)} />
        </div>
      )}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar
          title={titles[pathname] ?? "ParkSmart"}
          leading={
            <Button variant="ghost" size="icon" aria-label="Open menu" className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="size-4" />
            </Button>
          }
          search={
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (q.trim()) navigate({ to: "/customers", search: { q: q.trim() } });
              }}
            >
              <SearchField label="Search customers" placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} />
            </form>
          }
          user={{ name: "Admin", role: "Operator" }}
        />
        <main key={pathname} className="animate-fade-up space-y-6 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
