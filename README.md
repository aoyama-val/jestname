# jestname

Specify file name + ':' + line number to print the test name of the line.

## Examples

```
$ node index.js examples/01.js:15
des1 it1
```

```
$ npx jest -- -t $(node index.js examples/01.js:15)
```
