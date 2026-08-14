import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"JOKES — Our Friendship Story",description:"A cinematic digital memory book for the people who make life better."};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
