# Custom-domain status

Checked 18 October 2026. A request to `https://montyxlabel.cyou` returned a page stating the domain “is currently parked with NicNames.com”: https://nicnames.com/en. The root HTTPS endpoint responds, but the MONTYX site is not attached to this Webdev project. The project infrastructure overview reports no deployed host/domain configuration. `dig` is not installed in the current Sandbox, so no A/AAAA/CNAME records were independently collected. No registrar/DNS credentials or integration were available here.

Once the project host returns the actual custom-domain target, the domain owner must configure the exact DNS records with the current provider. Verify root, `www`, HTTPS certificate and direct route refresh before announcing the custom domain. Do not change DNS based on guessed targets.
