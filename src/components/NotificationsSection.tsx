import { motion } from "framer-motion";
import { Bell, Calendar, UserCheck, Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const icons = [Calendar, UserCheck, Clock, Bell];

const NotificationsSection = () => {
  const { t } = useLanguage();
  const mockNotifications = t.notifications.mockNotifications;

  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              {t.notifications.title} <span className="text-gradient">{t.notifications.titleHighlight}</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {t.notifications.description}
            </p>

            <div className="space-y-4">
              {t.notifications.items.map((item, index) => {
                const Icon = icons[index];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative flex items-center justify-center">
              {/* Background gradient */}
              <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-warm opacity-30 blur-3xl" />
              
              {/* Notification cards mockup */}
              <div className="relative z-10 space-y-4 w-full max-w-sm">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="p-4 rounded-2xl bg-card border border-border shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{mockNotifications.scholarLive.title}</p>
                      <p className="text-muted-foreground text-xs">{mockNotifications.scholarLive.subtitle}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{mockNotifications.scholarLive.time}</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="p-4 rounded-2xl bg-card border border-border shadow-lg ms-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{mockNotifications.dailyRecitation.title}</p>
                      <p className="text-muted-foreground text-xs">{mockNotifications.dailyRecitation.subtitle}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{mockNotifications.dailyRecitation.time}</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="p-4 rounded-2xl bg-card border border-border shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{mockNotifications.khatmahStarting.title}</p>
                      <p className="text-muted-foreground text-xs">{mockNotifications.khatmahStarting.subtitle}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{mockNotifications.khatmahStarting.time}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NotificationsSection;
