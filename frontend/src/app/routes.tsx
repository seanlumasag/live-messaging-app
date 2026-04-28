import { createBrowserRouter } from "react-router";
import { AuthPage } from "./components/AuthPage";
import { ChatPage } from "./components/ChatPage";
import { SettingsPage } from "./components/SettingsPage";
import { FriendsPage } from "./components/FriendsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthPage,
  },
  {
    path: "/chat",
    Component: ChatPage,
  },
  {
    path: "/friends",
    Component: FriendsPage,
  },
  {
    path: "/settings",
    Component: SettingsPage,
  },
]);
