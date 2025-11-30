import { BookOpen } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border bg-card shadow-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Royalty Reconciliation Tool
            </h1>
            <p className="text-sm text-muted-foreground">
              Author Royalty Operations Team
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
