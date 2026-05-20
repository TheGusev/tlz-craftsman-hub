## Изменения в `.github/workflows/deploy.yml`

1. В шаге `actions/setup-node@v4` убрать строку `cache: 'npm'`, оставив только `node-version: '20'`.
2. Заменить `npm ci` на `npm install`.

Остальные шаги (Chrome для prerender, build:prod с PRERENDER=1, FTP deploy, concurrency) не трогаем.

### Diff

```yaml
       - uses: actions/setup-node@v4
         with:
           node-version: '20'
-          cache: 'npm'

       - name: Install dependencies
-        run: npm ci
+        run: npm install
```
