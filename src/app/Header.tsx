import { Button } from "@/components/ui/button"
import { OrganizationSwitcher, SignIn, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"

const Header = () => {
  return (
    <div className="z-10 relative border-b py-4 bg-gray-50 " >
      <div className="flex mx-auto justify-between container items-center">
        <Link href="/" className="flex gap-2 items-center justify-center">
          <Image
            src="/logo.png"
            alt="FileDrive"
            width="50"
            height="50"

          />
          <span className="text-black font-bold">
            FileDrive
          </span>
        </Link>

        <SignedIn>

          <Button>
            <Link href="/dashboard/files">Your Files</Link>
          </Button>
        </SignedIn>
        <div className="flex gap-2">
          <OrganizationSwitcher />
          <UserButton />
        </div>

        <SignedOut>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  )
}

export default Header