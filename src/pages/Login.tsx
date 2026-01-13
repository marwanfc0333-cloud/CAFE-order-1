import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '../context/AppContext';
import { DataStore } from '../data/storage';
import { Waiter } from '../types';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

const Login = () => {
  const { login, settings } = useAppContext();
  const [pin, setPin] = useState('');
  const [waiters, setWaiters] = useState<Waiter[]>([]);

  useEffect(() => {
    setWaiters(DataStore.getWaiters());
  }, []);

  const handleLogin = (waiter?: Waiter) => {
    const targetWaiter = waiter || waiters.find(w => w.pin === pin);

    if (targetWaiter) {
      login(targetWaiter);
    } else {
      toast.error("رمز PIN غير صحيح. يرجى المحاولة مرة أخرى.");
      setPin('');
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value);
      if (value.length === 4) {
        // Attempt login automatically if 4 digits are entered
        const targetWaiter = waiters.find(w => w.pin === value);
        if (targetWaiter) {
            handleLogin(targetWaiter);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">{settings.cafeName}</CardTitle>
          <p className="text-lg text-muted-foreground mt-2">تسجيل دخول النادل</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-center">
              <LogIn className="w-12 h-12 text-primary" />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="pin" className="text-right block font-medium">أدخل رمز PIN الخاص بك (4 أرقام)</label>
              <Input
                id="pin"
                type="password"
                placeholder="****"
                value={pin}
                onChange={handlePinChange}
                maxLength={4}
                className="text-center text-3xl h-16 tracking-[0.5em]"
                inputMode="numeric"
                autoFocus
              />
            </div>
            
            <Button 
              onClick={() => handleLogin()} 
              disabled={pin.length !== 4}
              className="w-full h-12 text-lg"
            >
              تسجيل الدخول
            </Button>
            
            <div className="pt-4 border-t">
                <h3 className="text-center text-sm text-muted-foreground mb-2">أو اختر نادلاً:</h3>
                <div className="grid grid-cols-2 gap-3">
                    {waiters.filter(w => w.pin !== settings.adminPin).map(waiter => (
                        <Button 
                            key={waiter.id} 
                            variant="secondary" 
                            className="h-14 text-lg"
                            onClick={() => login(waiter)}
                        >
                            {waiter.name}
                        </Button>
                    ))}
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;