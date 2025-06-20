"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../../globals.css";
import "@mantine/core/styles.css";
import { AppShell, Burger, Group, Text } from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";
import { MdOutlineCategory, MdSpaceDashboard } from "react-icons/md";
import { IoListCircleSharp } from "react-icons/io5";
import { FaTable } from "react-icons/fa";
import { BsPatchPlus } from "react-icons/bs";
import { RiCoupon3Fill } from "react-icons/ri";
import { VscGraph } from "react-icons/vsc";
import { IoIosLogOut } from "react-icons/io";
import { HiOutlineDocumentText } from "react-icons/hi2";
import Link from "next/link";
import { logout } from "@/lib/database/actions/vendor/auth/logout";
import { getVendorCookiesandFetchVendor } from "@/lib/database/actions/vendor/vendor.actions";
import { modals, ModalsProvider } from "@mantine/modals";
import Logo from "@/components/Logo";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  
  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const res = await getVendorCookiesandFetchVendor();
        if (res?.success) {
          setVendor(res?.vendor);
        } else {
          // If no valid vendor, redirect to signin
          router.push("/signin");
        }
      } catch (error: any) {
        console.log(error);
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    };
    fetchVendorDetails();
  }, [router]);
  
  useEffect(() => {
    if (vendor && !vendor.verified) {
      router.push("/");
    }
  }, [vendor, router]);
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error: any) {
      console.log(error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // If no vendor after loading, don't render the dashboard
  if (!vendor) {
    return null;
  }

  return (
    <ModalsProvider>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
        }}
        padding={"md"}
      >
        <AppShell.Header>
          <Group h={"100%"} px={"md"}>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size={"sm"}
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size={"sm"}
            />
            <Logo />
          </Group>
        </AppShell.Header>
        <AppShell.Navbar p={"md"}>
          <div>
            <div className="flex gap-[30px] items-center p-[10px] rounded-md hover:bg-blue-100">
              <Link href={"/vendor/dashboard"}>
                <MdSpaceDashboard size={20} />
              </Link>
              <Link href={"/vendor/dashboard"}>
                <div className="">Vendor Dashboard</div>
              </Link>
            </div>
            <div className="flex gap-[30px] items-center p-[10px] rounded-md hover:bg-blue-100">
              <Link href={"/vendor/dashboard/coupons"}>
                <RiCoupon3Fill size={20} />
              </Link>
              <Link href={"/vendor/dashboard/coupons"}>
                <div className="">Coupons</div>
              </Link>
            </div>
            <div className="">Orders:</div>
            <div className="flex gap-[30px] items-center p-[10px] rounded-md hover:bg-blue-100">
              <Link href={"/vendor/dashboard/orders"}>
                <IoListCircleSharp size={20} />
              </Link>
              <Link href={"/vendor/dashboard/orders"}>
                <div className="">Orders</div>
              </Link>
            </div>
            <div className="">Products:</div>
            <div className="flex gap-[30px] items-center p-[10px] rounded-md hover:bg-blue-100">
              <Link href={"/vendor/dashboard/product/all/tabular"}>
                <FaTable size={20} />
              </Link>
              <Link href={"/vendor/dashboard/product/all/tabular"}>
                <div className="">All Products</div>
              </Link>
            </div>
            <div className="flex gap-[30px] items-center p-[10px] rounded-md hover:bg-blue-100">
              <Link href={"/vendor/dashboard/product/create"}>
                <BsPatchPlus size={20} />
              </Link>
              <Link href={"/vendor/dashboard/product/create"}>
                <div className="">Create product</div>
              </Link>
            </div>
            <div className="">Blog Management:</div>
            <div className="flex gap-[30px] items-center p-[10px] rounded-md hover:bg-blue-100">
              <Link href={"/vendor/dashboard/blogs"}>
                <HiOutlineDocumentText size={20} />
              </Link>
              <Link href={"/vendor/dashboard/blogs"}>
                <div className="">Manage Blogs</div>
              </Link>
            </div>
            <div className="flex gap-[30px] items-center p-[10px] rounded-md hover:bg-blue-100">
              <Link href={"/vendor/dashboard/blogs/create"}>
                <BsPatchPlus size={20} />
              </Link>
              <Link href={"/vendor/dashboard/blogs/create"}>
                <div className="">Create Blog</div>
              </Link>
            </div>
            {/* <div className="">Categories:</div>
            <div className="flex gap-[30px] items-center p-[10px] rounded-md hover:bg-blue-100">
              <Link href={"/vendor/dashboard/categories"}>
                <MdOutlineCategory size={20} />
              </Link>
              <Link href={"/vendor/dashboard/categories"}>
                <div className="">Categories</div>
              </Link>
            </div> */}
            {/* <div className="flex gap-[30px] items-center p-[10px] rounded-md hover:bg-blue-100">
              <Link href={"/vendor/dashboard/subCategories"}>
                <MdOutlineCategory
                  size={20}
                  style={{ transform: "rotate(180deg)" }}
                />
              </Link>
              <Link href={"/vendor/dashboard/subCategories"}>
                <div className="">Sub Categories</div>
              </Link>
            </div> */}
            <div className="">Analytics:</div>
            <div className="flex gap-[30px] items-center p-[10px] rounded-md hover:bg-blue-100">
              <Link href={"/vendor/dashboard/analytics/order"}>
                <VscGraph size={20} />
              </Link>
              <Link href={"/vendor/dashboard/analytics/order"}>
                <div className="">Order Analytics</div>
              </Link>
            </div>
            <div
              onClick={() => {
                modals.openConfirmModal({
                  title: "Logout",
                  centered: true,
                  children: <Text size="sm">Do you want to log out?</Text>,
                  labels: {
                    confirm: "Yes, Logout",
                    cancel: "Cancel",
                  },
                  confirmProps: { color: "red" },
                  onCancel: () => console.log("Cancel"),
                  onConfirm: handleLogout,
                });
              }}
              className="cursor-pointer flex gap-[30px] items-center p-[10px] rounded-md hover:bg-blue-100 "
            >
              <IoIosLogOut size={20} />
              <div className="">Logout</div>
            </div>
          </div>
        </AppShell.Navbar>
        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </ModalsProvider>
  );
}
