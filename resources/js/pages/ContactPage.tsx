import { Nav } from "../components/Nav";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

 export function ContactPage() {
   const socials = [
     { name: "WhatsApp", handle: "+591 78768481", url: "https://wa.me/59178768481" },
     { name: "Facebook", handle: "VØRN", url: "https://www.facebook.com/share/18WmovUK5J/" },
     { name: "Instagram", handle: "@vorn_369", url: "https://www.instagram.com/vorn_369/?utm_source=ig_web_button_share_sheet" },
     { name: "TikTok", handle: "@vorn_369", url: "https://www.tiktok.com/@vorn_369?is_from_webapp=1&sender_device=pc" },
   ];
   
      return (
        <div className="min-h-[100svh] w-full bg-[#f4f5f7] text-neutral-900 font-sans">
          {/* Reutilizamos tu Nav */}
          <Nav />
          
          <main className="pt-32 pb-20 px-6 md:px-12 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-[40px] md:text-[70px] font-medium tracking-tighter leading-none mb-12">
                Contacto.
              </h1>
   
              <div className="flex flex-col border-t border-neutral-200">
                {socials.map((social, i) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group flex items-center justify-between py-6 border-b border-neutral-200/60
 hover:border-neutral-900 transition-colors"
                  >
                    <div>
                      <div className="text-[18px] font-medium tracking-tight group-hover:pl-2 transition-all
 duration-300">
                        {social.name}
                      </div>
                      <div className="text-[13px] text-neutral-500 mt-1 group-hover:pl-2 transition-all
 duration-300 delay-75">
                        {social.handle}
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-neutral-300 group-hover:text-neutral-900
 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </main>
        </div>
      );
    }
