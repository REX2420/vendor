"use client";
import { Button, Group } from "@mantine/core";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/database/actions/vendor/auth/logout";
import { useEffect, useState } from "react";
import { getVendorCookiesandFetchVendor } from "@/lib/database/actions/vendor/vendor.actions";

import React from "react";
import Logo from "./Logo";

const Navbar = () => {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const res = await getVendorCookiesandFetchVendor();
        if (res?.success) {
          setVendor(res?.vendor);
        } else {
          setVendor(null);
        }
      } catch (error: any) {
        console.log(error);
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setVendor(null);
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <header className="p-[1rem] border-b-[1px] border-b-[#eaeaea]">
        <nav className="flex justify-between items-center">
          <Logo />
          <div>Loading...</div>
        </nav>
      </header>
    );
  }

  return (
    <header className="p-[1rem] border-b-[1px] border-b-[#eaeaea]">
      <nav className="flex justify-between items-center">
        <Logo />
        <Group>
          {vendor && vendor.name ? (
            <div className="flex gap-[10px]">
              <Button
                variant="outline"
                onClick={() => router.push("/vendor/dashboard")}
              >
                Vendor Dashboard
              </Button>
              <Button onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex gap-[10px]">
              <Button variant="outline" onClick={() => router.push("/signin")}>
                Sign in
              </Button>
              <Button onClick={() => router.push("/signup")}>Sign Up</Button>
            </div>
          )}
        </Group>
      </nav>
    </header>
  );
};

export default Navbar;
