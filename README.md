# @open-core/ragemp-adapter

External Rage Multiplayer adapter for `@open-core/framework`.

## Install

```bash
pnpm add @open-core/ragemp-adapter
```

## CLI Usage

Use the OpenCore CLI and select the `RageMP` adapter during `opencore init`.

The generated `opencore.config.ts` will look like this:

```ts
import { defineConfig } from '@open-core/cli'
import { RageMPClientAdapter } from '@open-core/ragemp-adapter/client'
import { RageMPServerAdapter } from '@open-core/ragemp-adapter/server'

export default defineConfig({
  name: 'my-ragemp-server',
  destination: 'C:/ragemp-server',
  adapter: {
    server: RageMPServerAdapter(),
    client: RageMPClientAdapter(),
  },
  build: {
    target: 'node14',
  },
})
```

## Manual Usage

```ts
import { Server } from '@open-core/framework/server'
import { Client } from '@open-core/framework/client'
import { RageMPServerAdapter } from '@open-core/ragemp-adapter/server'
import { RageMPClientAdapter } from '@open-core/ragemp-adapter/client'

await Server.init({ mode: 'CORE', adapter: RageMPServerAdapter() })
await Client.init({ mode: 'CORE', adapter: RageMPClientAdapter() })
```

## Notes

- RageMP server output is built for Node 14.
- Server files are emitted to `packages/`.
- Client files are emitted to `client_packages/`.
