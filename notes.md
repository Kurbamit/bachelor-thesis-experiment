# Eksperimento vykdymo užrašai

1. Eksperimentui atlikti naudojama [OpenNebula](https://grid5.mif.vu.lt/cloud3/one/) (Ubuntu).
2. Grafana veikia VM docker. Grafana pasiekiama per SSH Port Forwarding. Komanda, naudojama SSH Port Forwaring: `ssh -p 3140 -L 3000:localhost:3000 doce9051@193.219.91.103` `-p` - VM port'as.
3. Run sharding-api docker: ```
  docker run -d -p 8080:8080 \
  -v ~/.ssh/id_ed25519:/app/.ssh/id_ed25519:ro \
  -e SshTunnel__PrivateKeyPath=/app/.ssh/id_ed25519 \
  sharding-api
  ```