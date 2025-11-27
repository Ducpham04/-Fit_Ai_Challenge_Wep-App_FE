import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { SimpleModal } from "@/components_1/ui/simple-modal";

interface ComingSoonPageProps {
  title: string;
  description: string;
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex p-3 bg-yellow-100 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 text-lg">{description}</p>
        <div className="mt-6">
          <Button onClick={() => setOpen(true)}>Notify me</Button>
        </div>
        <SimpleModal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Coming Soon"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            </div>
          }
        >
          <p className="text-gray-600">We'll notify you when this feature is available.</p>
        </SimpleModal>
      </div>
    </div>
  );
}
