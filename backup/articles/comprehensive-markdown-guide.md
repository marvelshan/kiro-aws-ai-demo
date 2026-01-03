---
title: "Comprehensive Markdown Guide"
date: "2024-12-05"
description: "A complete guide demonstrating all supported markdown features including headings, lists, code blocks, tables, and more"
tags: ["markdown", "tutorial", "guide", "documentation"]
---

# Comprehensive Markdown Guide

This article demonstrates all the markdown features supported by our blog system. Use this as a reference when writing your own articles.

## Text Formatting

You can make text **bold** or *italic*, or even ***both***. You can also use ~~strikethrough~~ text.

## Headings

Headings from H1 to H6 are supported:

### This is H3
#### This is H4
##### This is H5
###### This is H6

## Lists

### Unordered Lists

- First item
- Second item
- Third item
  - Nested item 1
  - Nested item 2
    - Deeply nested item

### Ordered Lists

1. First step
2. Second step
3. Third step
   1. Sub-step A
   2. Sub-step B

### Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task to do

## Links and Images

Here's a [link to GitHub](https://github.com).

You can also use reference-style links: [Google][1]

[1]: https://google.com

Images work similarly:
![Alt text for image](https://via.placeholder.com/400x200?text=Sample+Image)

## Code

### Inline Code

Use `inline code` for short snippets like `const x = 42;`.

### Code Blocks

JavaScript example:

```javascript
// Function to calculate factorial
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5)); // Output: 120
```

Python example:

```python
# List comprehension example
squares = [x**2 for x in range(10)]
print(squares)

# Dictionary comprehension
word_lengths = {word: len(word) for word in ['hello', 'world', 'python']}
```

TypeScript example:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return `Hello, ${user.name}!`;
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

console.log(greetUser(user));
```

Bash/Shell example:

```bash
#!/bin/bash

# Deploy script
echo "Building project..."
npm run build

echo "Deploying to S3..."
aws s3 sync dist/ s3://my-bucket/ --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"

echo "Deployment complete!"
```

## Blockquotes

> This is a blockquote. It can span multiple lines and is great for highlighting important information or quotes from other sources.
>
> You can have multiple paragraphs in a blockquote.

Nested blockquotes:

> This is the first level
>> This is nested
>>> This is deeply nested

## Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headings | ✅ | H1-H6 |
| Lists | ✅ | Ordered, unordered, nested |
| Code blocks | ✅ | With syntax highlighting |
| Tables | ✅ | As shown here |
| Images | ✅ | Standard markdown syntax |
| Links | ✅ | Inline and reference style |

Alignment in tables:

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Left | Center | Right |
| Text | Text | Text |
| 1 | 2 | 3 |

## Horizontal Rules

You can create horizontal rules with three or more hyphens, asterisks, or underscores:

---

***

___

## Special Characters and Escaping

You can escape special characters with backslash: \* \_ \` \[ \]

## HTML Support

Some HTML tags work in markdown:

<div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
  <strong>Note:</strong> This is HTML embedded in markdown.
</div>

<details>
<summary>Click to expand</summary>

This content is hidden by default and can be expanded by clicking the summary.

</details>

## Mathematical Expressions

While not all markdown parsers support math, you can use inline code for simple expressions: `E = mc²`

For more complex math, you might need to use images or specialized libraries.

## Emojis

Some markdown parsers support emojis: 😀 🎉 🚀 ✨ 💻 📝

## Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

## Definition Lists

Term 1
: Definition 1

Term 2
: Definition 2a
: Definition 2b

## Best Practices

1. **Use descriptive headings** - They help with navigation and SEO
2. **Keep paragraphs short** - Easier to read on all devices
3. **Use code blocks for code** - Better formatting and syntax highlighting
4. **Add alt text to images** - Improves accessibility
5. **Test your markdown** - Preview before publishing

## Conclusion

This guide covers most markdown features supported by standard parsers. When writing articles for this blog:

- Always include frontmatter with title and date
- Use descriptive tags for better organization
- Test code examples to ensure they work
- Keep content well-structured with headings
- Use images and tables to enhance understanding

Happy writing! 📝
