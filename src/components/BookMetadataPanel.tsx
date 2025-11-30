import { Book, Hash, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMetadata } from "@/types/royalty";

interface BookMetadataPanelProps {
  metadata: BookMetadata;
}

const BookMetadataPanel = ({ metadata }: BookMetadataPanelProps) => {
  return (
    <Card className="animate-fade-in shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Book className="h-5 w-5 text-primary" />
          Book Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Book className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="text-base font-semibold text-foreground">
                {metadata.title}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Hash className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">ISBN</p>
              <p className="font-mono text-base font-semibold text-foreground">
                {metadata.isbn}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Author</p>
              <p className="text-base font-semibold text-foreground">
                {metadata.author}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookMetadataPanel;
