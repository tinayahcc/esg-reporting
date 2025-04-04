"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  BookOpen,
  Headphones,
  Home,
  Leaf,
  LogIn,
  LogOut,
  Menu,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data, status } = useSession();
  const isESGTeamMember = data?.user?.role === "esg_team";
  const isLoggedIn = status === "authenticated";
  const routes = [
    { name: "Home", path: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <BarChart3 className="h-4 w-4 mr-2" />,
    },
    {
      name: "Learn",
      path: "/learn",
      icon: <BookOpen className="h-4 w-4 mr-2" />,
    },
    {
      name: "Services",
      path: "/services",
      icon: <Headphones className="h-4 w-4 mr-2" />,
    },
    { name: "About", path: "/about", icon: <Users className="h-4 w-4 mr-2" /> },
  ];

  // Add ESG Team section for ESG team members
  if (isESGTeamMember) {
    routes.splice(2, 0, {
      name: "ESG Review",
      path: "/esg-review",
      icon: <Users className="h-4 w-4 mr-2 text-primary" />,
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">GreenStart</span>
        </Link>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                pathname === route.path
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {route.icon}
              {route.name}
            </Link>
          ))}

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 flex items-center gap-2 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {data?.user?.name?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium leading-none">
                      {data?.user?.name?.split(" ")[0] || "Guest"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isESGTeamMember ? "ESG Team" : data?.user?.company}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {data?.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {data?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/sign-in">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm">
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden">
            <nav className="container flex flex-col py-4">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`flex items-center py-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname === route.path
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {route.icon}
                  {route.name}
                </Link>
              ))}

              {isLoggedIn ? (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {data?.user?.name?.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{data?.user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {isESGTeamMember ? "ESG Team" : data?.user?.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      asChild
                    >
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      asChild
                    >
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="justify-start"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
                  <Button variant="outline" asChild>
                    <Link
                      href="/auth/sign-in"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                  <Button>
                    <Link
                      href="/auth/sign-up"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
