# Pocketbase setup

Add [pocketbase](https://pocketbase.io/docs) to `./pocketbase`

## redirect website to s3

```
location /s/ {
    # 1. Rewrite the incoming request /s/filename to the S3 path
    rewrite ^/s/(.*) /object/v1/<s3 id>/<bucket name>/<path>/$1 break;
    
    # 2. Proxy to the Infomaniak S3 endpoint
    proxy_pass https://s3.pub2.infomaniak.cloud;
    
    # 3. Essential headers for SSL S3 connection
    proxy_set_header Host s3.pub2.infomaniak.cloud;
    proxy_ssl_server_name on;
    
    # Optional: Hide S3 headers for security
    proxy_hide_header x-amz-request-id;
    proxy_hide_header x-amz-id-2;
}
```

## start service

Create `/lib/systemd/system/<project>.service`

```
[Unit]
Description = <project>

[Service]
Type             = simple
User             = root
Group            = root
LimitNOFILE      = 4096
Restart          = always
RestartSec       = 5s
StandardOutput   = append:/home/debian/<project>/std.log
StandardError    = append:/home/debian/<project>/std.log
WorkingDirectory = /home/debian/<project>
ExecStart        = /home/debian/<project>/pocketbase serve --http=127.0.0.1:8090

[Install]
WantedBy = multi-user.target
```

Start it `sudo systemctl enable --now <project>`