"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Input,
  Badge,
  Switch,
} from "@heroui/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

export function Header({ sidebarCollapsed = false }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Navbar
      className={`fixed top-0 z-30 transition-all duration-300 ${
        sidebarCollapsed ? "left-16" : "left-64"
      }`}
      maxWidth="full"
      isBordered
    >
      <NavbarContent justify="start">
        <NavbarItem className="hidden lg:flex">
          <Input
            classNames={{
              base: "max-w-xs",
              mainWrapper: "h-full",
              input: "text-small",
              inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
            }}
            placeholder="Search..."
            size="sm"
            startContent={
              <svg
                className="w-4 h-4 text-default-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
            type="search"
          />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {/* Theme Toggle */}
        <NavbarItem>
          {mounted && (
            <Button
              isIconOnly
              variant="light"
              onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </Button>
          )}
        </NavbarItem>

        {/* Notifications */}
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button isIconOnly variant="light">
                <Badge content="3" color="danger" size="sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </Badge>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Notifications" className="w-80">
              <DropdownItem key="1" description="New hiring requisition submitted">
                Requisition #REQ-001
              </DropdownItem>
              <DropdownItem key="2" description="Training completed by John Doe">
                Course Completion
              </DropdownItem>
              <DropdownItem key="3" description="Performance review due in 3 days">
                Review Reminder
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>

        {/* User Menu */}
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform"
                color="primary"
                name="Admin User"
                size="sm"
                src="https://i.pravatar.cc/150?u=admin"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">admin@qinfinity.com</p>
              </DropdownItem>
              <DropdownItem key="settings">Settings</DropdownItem>
              <DropdownItem key="help">Help & Feedback</DropdownItem>
              <DropdownItem key="logout" color="danger">
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}

