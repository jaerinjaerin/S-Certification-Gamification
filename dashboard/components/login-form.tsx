import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import process from 'process';
import packageJson from '@/package.json';
import { IconSplus } from '@/components/icons/bien';
import { LoginButton } from '@/components/ui/login-button';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const env = (process.env.NEXT_PUBLIC_ENV ?? 'default').toUpperCase();
  const version = packageJson.version;

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            <div className="flex items-center gap-2">
              <div>
                <IconSplus inverted={true} className={'w-8 h-8'} />
              </div>
              <div>Certification Admin</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginButton />

          <div className="mt-4 text-center text-sm">
            {env}-{version}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
