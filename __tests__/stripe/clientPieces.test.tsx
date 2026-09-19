/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { usePageRestoreCount } from '@/lib/pageRestore';
import QrActions from '@/components/QrActions';

function pageShow(persisted: boolean) {
  const event = new Event('pageshow');
  Object.defineProperty(event, 'persisted', { value: persisted });
  act(() => {
    window.dispatchEvent(event);
  });
}

describe('usePageRestoreCount (architecture §4.1.1)', () => {
  it('counts only back-forward-cache restores', () => {
    const { result } = renderHook(() => usePageRestoreCount());
    const start = result.current;
    pageShow(false);
    expect(result.current).toBe(start);
    pageShow(true);
    expect(result.current).toBe(start + 1);
  });

  it('remounts a form keyed by it, resetting its pending state', () => {
    function Pending() {
      const [pending, setPending] = React.useState(false);
      return (
        <button type="button" disabled={pending} onClick={() => setPending(true)}>
          {pending ? 'pending' : 'rest'}
        </button>
      );
    }
    function Keyed() {
      const count = usePageRestoreCount();
      return <Pending key={count} />;
    }
    render(<Keyed />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('pending');
    pageShow(true);
    expect(screen.getByRole('button')).toHaveTextContent('rest');
    expect(screen.getByRole('button')).toBeEnabled();
  });
});

// 1×1 transparent PNG
const DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('QrActions (AC 9)', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'canShare');
    Reflect.deleteProperty(navigator, 'share');
  });

  it('offers Save only where the browser cannot share files', () => {
    render(<QrActions dataUrl={DATA_URL} fileName="qr.png" saveLabel="Save QR code" shareLabel="Share QR code" />);
    const save = screen.getByRole('link', { name: 'Save QR code' });
    expect(save).toHaveAttribute('href', DATA_URL);
    expect(save).toHaveAttribute('download', 'qr.png');
    expect(screen.queryByRole('button', { name: 'Share QR code' })).toBeNull();
  });

  it('adds Share under Save where files can be shared; a cancelled share changes nothing', async () => {
    const share = jest.fn().mockRejectedValue(new Error('AbortError'));
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true });
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });

    render(<QrActions dataUrl={DATA_URL} fileName="qr.png" saveLabel="Save QR code" shareLabel="Share QR code" />);
    const button = screen.getByRole('button', { name: 'Share QR code' });
    await act(async () => {
      fireEvent.click(button);
    });

    expect(share).toHaveBeenCalledTimes(1);
    const [{ files }] = share.mock.calls[0];
    expect(files[0].type).toBe('image/png');
    expect(files[0].name).toBe('qr.png');
    expect(screen.getByRole('link', { name: 'Save QR code' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Share QR code' })).toBeInTheDocument();
  });
});
