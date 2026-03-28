# Eksperimento vykdymo užrašai

1. Eksperimentui atlikti naudojama [OpenNebula](https://grid5.mif.vu.lt/cloud3/one/) (Ubuntu).
2. Grafana veikia VM docker. Grafana pasiekiama per SSH Port Forwarding. Komanda, naudojama SSH Port Forwaring: `ssh -p 3140 -L 3000:localhost:3000 doce9051@193.219.91.103` `-p` - VM port'as.
3. Run sharding-api docker: ```
  docker run -d -p 8080:8080 \
  -v ~/.ssh/id_ed25519:/app/.ssh/id_ed25519:ro \
  -e SshTunnel__PrivateKeyPath=/app/.ssh/id_ed25519 \
  sharding-api
  ```
4. SSH Tunnel for redis:
```
ssh -v -p 11200 -N \
-L 7001:localhost:7001 \
-L 7002:localhost:7002 \
-L 7003:localhost:7003 \
-L 7004:localhost:7004 \
-L 7005:localhost:7005 \
-L 7006:localhost:7006 \
doce9051@193.219.91.103
```