"use client";
import { usePathname, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BiBuildings,
  BiSolidBuildings,
  BiCog,
  BiSolidCog,
  BiFolder,
  BiSolidFolder,
  BiGroup,
  BiSolidGroup,
} from "react-icons/bi";

export default function Sidebar() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const orgId = params["orgId"];

  const items = [
    {
      label: "General",
      href: `/organizations/${orgId}/manage/general`,
      icon: <BiCog size="1.25em" className="inline-block mr-2" />,
      iconActive: (
        <BiSolidCog size="1.25em" className="inline-block mr-2 text-primary" />
      ),
    },
    {
      label: "Departments",
      href: `/organizations/${orgId}/manage/departments`,
      icon: <BiBuildings size="1.25em" className="inline-block mr-2" />,
      iconActive: (
        <BiSolidBuildings
          size="1.25em"
          className="inline-block mr-2 text-primary"
        />
      ),
    },
    {
      label: "Members",
      href: `/organizations/${orgId}/manage/members`,
      icon: <BiGroup size="1.25em" className="inline-block mr-2" />,
      iconActive: (
        <BiSolidGroup
          size="1.25em"
          className="inline-block mr-2 text-primary"
        />
      ),
    },
    {
      label: "Applicants",
      href: `/organizations/${orgId}/manage/applicants`,
      icon: <BiFolder size="1.25em" className="inline-block mr-2" />,
      iconActive: (
        <BiSolidFolder
          size="1.25em"
          className="inline-block mr-2 text-primary"
        />
      ),
    },
  ];

  return (
    <div className="w-full md:w-52 md:border-r-2 border-b-2 md:border-b-0">
      <ul className="flex md:flex-col justify-center md:justify-start p-4 md:p-0 gap-2">
        {items.map((item, index) => (
          <li
            className="btn btn-ghost btn-sm md:!justify-start !normal-case !font-normal"
            key={index}
            onClick={() => router.push(item.href)}
          >
            {pathname === item.href ? item.iconActive : item.icon}{" "}
            <Link
              className={`text-xs ${
                pathname === item.href ? "font-bold text-primary" : ""
              }`}
              href={item.href}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
