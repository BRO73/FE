import { useEffect, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
    onConfirm: () => void;
};

export default function ConfirmCancelDialog({ onConfirm }: Props) {
    const [open, setOpen] = useState(false);
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (open) {
            setCountdown(3);
            timer = setInterval(() => {
                setCountdown((c) => {
                    if (c <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return c - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [open]);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Cancel</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc muốn hủy món này?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Thao tác này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Không</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={countdown > 0}
                        onClick={() => {
                            onConfirm();
                            setOpen(false);
                        }}
                    >
                        {countdown > 0 ? `Yes (${countdown})` : "Yes"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
