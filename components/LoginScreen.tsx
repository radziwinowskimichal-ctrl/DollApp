import { User, LogIn } from "lucide-react";
import { useApp } from "@/lib/context";
import { translations } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LoginScreen() {
  const { profiles, loginUser, language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.pl;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-8 border-b bg-muted/10">
          <CardTitle className="text-3xl font-bold tracking-tight mb-2 text-primary">{t.appTitle}</CardTitle>
          <CardDescription className="text-base">{t.selectProfile}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 mt-8 px-8 pb-8">
          {profiles.map(profile => (
             <button
                key={profile.id}
                disabled={profile.isOnline}
                onClick={() => loginUser(profile.id)}
                className={`
                  flex items-center justify-between p-4 rounded-xl border-2 transition-all group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  ${profile.isOnline 
                     ? "opacity-50 cursor-not-allowed bg-muted border-transparent" 
                     : "hover:border-primary hover:bg-primary/5 bg-background cursor-pointer active:scale-[0.98] border-border"}
                `}
             >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${profile.isOnline ? "bg-muted-foreground/20 text-muted-foreground" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"}`}>
                    <User className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-lg">{profile.name}</span>
                </div>
                {profile.isOnline ? (
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                    {t.profileInUse}
                  </Badge>
                ) : (
                   <span className="text-sm font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                     {t.login} <LogIn className="w-4 h-4 ml-1" />
                   </span>
                )}
             </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
