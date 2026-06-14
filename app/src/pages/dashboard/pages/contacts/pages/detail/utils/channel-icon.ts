import type { LucideIcon } from "lucide-react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";

export function channelIcon(channel: Channel): LucideIcon {
  if (channel === Channel.EMAIL) return Mail;
  if (channel === Channel.PHONE_CALL) return Phone;
  if (channel === Channel.LINKEDIN) return MessageCircle;
  return MessageCircle;
}
