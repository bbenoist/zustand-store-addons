import create from '../src';
import React from 'react';
// import ReactDOM from 'react-dom';
import { render } from '@testing-library/react'

it('creates a store hook and api object', () => {
  let params
  const result = create((...args) => {
    params = args
    return { value: null }
  })
  expect({ params, result }).toMatchInlineSnapshot(`
    Object {
      "params": Array [
        [Function],
        [Function],
        Object {
          "destroy": [Function],
          "getState": [Function],
          "setState": [Function],
          "subscribe": [Function],
        },
      ],
      "result": [Function],
    }
  `)
});

it('creates a store hook and api object passing empty addons', () => {
  let params
  const result = create((...args) => {
    params = args
    return { value: null }
  }, {})
  expect({ params, result }).toMatchInlineSnapshot(`
    Object {
      "params": Array [
        [Function],
        [Function],
        Object {
          "destroy": [Function],
          "getState": [Function],
          "setState": [Function],
          "subscribe": [Function],
        },
      ],
      "result": [Function],
    }
  `)
});

it('creates a store hook and api object passing addons obj', () => {
  let params
  const result = create((...args) => {
    params = args
    return { count: 0 }
  }, {
    computed: {
      doubleCount() {
        return this.count * 2;
      }
    },
    watchers: {
      count(newValue: number, oldValue: number) {
        console.log(newValue, oldValue);
      }
    },
    middleware: [],
    settings: {
      name: 'TestingStore',
      logLevel: 'diff'
    }
  })
  expect({ params, result }).toMatchInlineSnapshot(`
    Object {
      "params": Array [
        [Function],
        [Function],
        Object {
          "destroy": [Function],
          "getState": [Function],
          "setState": [Function],
          "subscribe": [Function],
        },
      ],
      "result": [Function],
    }
  `)
});

it('uses the store with no args', async () => {
  const useStore = create((set) => ({
    count: 1,
    inc: () => set((state) => ({ count: state.count + 1 })),
  }), {
    computed: {
      doubleCount() {
        return this.count * 2;
      }
    }
  })

  function Counter() {
    const { count, doubleCount, inc } = useStore()
    React.useEffect(inc, [])
    return (
      <div>
        <p>count: {count}</p>
        <p>doubleCount: {doubleCount}</p>
      </div>
    )
  }

  const { findByText } = render(<Counter />);

  await findByText('count: 2');
  await findByText('doubleCount: 4');
})


it('uses the store with selectors', async () => {
  const useStore = create((set) => ({
    count: 1,
    inc: () => set((state) => ({ count: state.count + 1 })),
  }), {
    computed: {
      doubleCount() {
        return this.count * 2;
      }
    }
  })

  function Counter() {
    const count = useStore((s) => s.count)
    const doubleCount = useStore((s) => s.doubleCount)
    const inc = useStore((s) => s.inc)
    React.useEffect(inc, [])
    return (
      <div>
        <p>count: {count}</p>
        <p>doubleCount: {doubleCount}</p>
      </div>
    )
  }

  const { findByText } = render(<Counter />)

  await findByText('count: 2');
  await findByText('doubleCount: 4');
})

it('uses the store with simplified fetch', async () => {
  const useStore = create((set) => ({
    count: 1,
    inc: () => set((state) => ({ count: state.count + 1 })),
  }), {
    computed: {
      doubleCount() {
        return this.count * 2;
      }
    }
  })

  function Counter() {
    const [count, doubleCount, inc] = useStore('count, doubleCount, inc');
    React.useEffect(inc, [])
    return (
      <div>
        <p>count: {count}</p>
        <p>doubleCount: {doubleCount}</p>
      </div>
    )
  }

  const { findByText } = render(<Counter />)

  await findByText('count: 2');
  await findByText('doubleCount: 4');
})

it('uses the store with simplified fetch and watchers', async () => {
  const useStore = create((set) => ({
    count: 1,
    inc: () => set((state) => ({ count: state.count + 1 })),
    moreThan5: false,
  }), {
    computed: {
      doubleCount() {
        return this.count * 2;
      },
      total() {
        return this.count + this.doubleCount;
      }
    },
    watchers: {
      total(newValue: number, oldValue: number) {
        if (newValue > 5 && oldValue <= 5) {
          this.set({ moreThan5: true })
        }
      }
    }
  })

  function Counter() {
    const [count, doubleCount, total, moreThan5, inc] = useStore('count, doubleCount, total, moreThan5, inc');
    React.useEffect(inc, [])
    return (
      <div>
        <p>count: {count}</p>
        <p>doubleCount: {doubleCount}</p>
        <p>total: {total}</p>
        {moreThan5 && <p>More than 5</p>}
      </div>
    )
  }

  const { findByText } = render(<Counter />)

  await findByText('count: 2');
  await findByText('doubleCount: 4');
  await findByText('total: 6');
  await findByText('More than 5');
})



