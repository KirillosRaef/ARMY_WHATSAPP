import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileDown, Plus } from "lucide-react";
import { Input } from "../ui/input";


export default function AddConversation() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");

  const handleAddConversation = async () => {
    const currentUserId = await fetch('/api/current-user-id');
    const currentUserIdData = await currentUserId.text();
    // console.log(currentUserIdData);
    
    const response = await fetch(`/api/add-conversation-by-number/${currentUserIdData}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number,
      }),
    });
    const data = await response.json();
    console.log(data);
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl px-5 py-2 text-sm font-medium h-9 border-0 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("table.addConversation")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-primary" />
            {t("table.addConversation")}
          </DialogTitle>
          <DialogDescription>
            {t("table.addConversationDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={t("table.number")}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="flex-1"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            className="rounded-xl"
          >
            {t("common.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={handleAddConversation}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl px-5 text-sm font-medium border-0 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("table.addConversation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}