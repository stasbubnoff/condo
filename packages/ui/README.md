## Table of contents
[Installation](#installation)\
[Usage](#usage)\
[Access theme colors](#access-theme-colors)

## Installation
To install package simply run the following command if you're using npm as your package manager:
```bash
npm i @open-condo/ui
```
or it's yarn alternative
```bash
yarn add @open-condo/ui
```

## Usage
You can import needed component with its props directly from package entry point like this:
```typescript
import { Button } from '@open-condo/ui'
import type { ButtonProps } from '@open-condo/ui'
```

## Access theme colors
You also can directly access to all our theme colors as well
by specifying import sub path like this:
```typescript
import { colors } from '@open-condo/ui/colors'
import type { ColorPalette } from '@open-condo/ui/colors'
```
