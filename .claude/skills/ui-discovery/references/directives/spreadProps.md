# @servicenow/aiux-directive-spread

## Import

```js
import {spreadProps} from '@servicenow/aiux-directives';
```


Lit directive for spreading properties onto elements.

## Installation

```bash
pnpm add @servicenow/aiux-directive-spread
```

## Usage

```js
import {html} from 'lit';
import {spreadProps} from '@servicenow/aiux-directive-spread';

const props = {
  disabled: true,
  value: 'example',
  className: 'custom-class'
};

html`<input ${spreadProps(props)} />`;
```

## API

### `spreadProps(data)`

A Lit directive that spreads properties from an object onto an element.

**Parameters:**

- `data` - Object containing properties to spread onto the element

**Note:** This directive might not work as expected in server-side rendering contexts. Forked from [open-wc/lit-helpers](https://github.com/open-wc/open-wc/blob/6a4065f781f6ab11f6513ffa97f2642939be2bb2/docs/docs/development/lit-helpers.md#ssr).

## Testing

```bash
cd directives/spread && pnpm test
```
