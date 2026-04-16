import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface AutoLogoutWarningProps {
  isOpen: boolean;
  remainingTime: number;
  onContinue: () => void;
  onLogout: () => void;
}

export const AutoLogoutWarning = ({ isOpen, remainingTime, onContinue, onLogout }: AutoLogoutWarningProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <DialogTitle>تنبيه تسجيل الخروج التلقائي</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            <p className="mb-2">تم اكتشاف عدم نشاط لفترة طويلة.</p>
            <p className="font-semibold text-lg text-center py-2">
              سيتم تسجيل خروجك تلقائياً خلال: <span className="text-red-500">{formatTime(remainingTime)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              اضغط على "متابعة الجلسة" لتمديد فترة دخولك.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button variant="destructive" onClick={onLogout} className="w-full sm:w-auto">
            تسجيل الخروج الآن
          </Button>
          <Button variant="default" onClick={onContinue} className="w-full sm:w-auto">
            متابعة الجلسة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
