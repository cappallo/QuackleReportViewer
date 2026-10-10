# Deployment on Ash

The authoritative source is `/home/tc/QuackleReportViewer` on Ash (Ubuntu WSL, SSH 2222). The published files are `/var/www/quackle.by.tc`. Both source and the existing published build were preserved during migration on October 10, 2026; the source dist index matched the published index. There is no application backend or deployment CI.

Build with `npm run build` in this checkout (use `npm ci` first when dependencies need installation), then run `bash deploy/publish.sh` on Ash. The publisher copies assets first and atomically replaces index.html. Existing hashed assets remain available to open browser sessions. Publishing from the retained Phoenix checkout no longer changes the public site.

Phoenix retains public HTTPS and certificate renewal during migration and proxies this site to Ash port 18081. The current Ash vhost is `deploy/quackle.by.tc.migration.conf`; the full HTTPS configuration is `deploy/quackle.by.tc.conf` for the later gateway handoff. Validate nginx before reloading. The normal Ash static-site backup includes the source and published files.
