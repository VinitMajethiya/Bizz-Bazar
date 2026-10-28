import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';
import { Contact } from './Contact';
import * as supabaseModule from '../../lib/supabase';

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
  isSupabaseConfigured: true,
}));

describe('MarkdownRenderer Component', () => {
  it('renders headings correctly', () => {
    const md = '# Main Title\n## Section Subtitle\n### Subsection';
    render(<MarkdownRenderer content={md} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section Subtitle');
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Subsection');
  });

  it('renders unordered bullet lists', () => {
    const md = '- First item\n- Second item\n* Third item';
    render(<MarkdownRenderer content={md} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('First item');
    expect(items[1]).toHaveTextContent('Second item');
    expect(items[2]).toHaveTextContent('Third item');
  });

  it('renders bold and italic inline styles', () => {
    const md = 'This has **bold text** and *italic text*.';
    render(<MarkdownRenderer content={md} />);

    expect(screen.getByText('bold text').tagName).toBe('STRONG');
    expect(screen.getByText('italic text').tagName).toBe('EM');
  });

  it('renders valid links securely with rel="noopener noreferrer"', () => {
    const md = 'Check out [our instagram](https://instagram.com/by.raya.co) here.';
    render(<MarkdownRenderer content={md} />);

    const link = screen.getByRole('link', { name: 'our instagram' });
    expect(link).toHaveAttribute('href', 'https://instagram.com/by.raya.co');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('neutralizes malicious javascript: or vbscript: links', () => {
    const md = 'Attack: [malicious link](javascript:alert("pwned")) here.';
    render(<MarkdownRenderer content={md} />);

    const link = screen.queryByRole('link', { name: 'malicious link' });
    // Safe renderer disables dangerous scheme hrefs (href="#")
    if (link) {
      expect(link.getAttribute('href')).toBe('#');
    }
  });

  it('handles empty or blank content gracefully without errors', () => {
    const { container } = render(<MarkdownRenderer content="" />);
    expect(container.firstChild).toBeNull();
  });
});

describe('Contact Page & Bot Honeypot Protection', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it('renders contact form fields and submission elements', () => {
    render(
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Contact />
          </MemoryRouter>
        </QueryClientProvider>
      </HelmetProvider>
    );

    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email or Phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();
  });

  it('discards submission silently if honeypot field is filled by a bot', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabaseModule.supabase.from).mockReturnValue({
      insert: mockInsert,
    } as unknown as ReturnType<typeof supabaseModule.supabase.from>);

    const { container } = render(
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Contact />
          </MemoryRouter>
        </QueryClientProvider>
      </HelmetProvider>
    );

    // Fill visible fields
    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'Spam Bot' } });
    fireEvent.change(screen.getByLabelText(/Email or Phone/i), { target: { value: 'bot@spam.com' } });
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Buy cheap watches' } });

    // Find and fill hidden honeypot input (#website)
    const honeypot = container.querySelector('#website') as HTMLInputElement;
    expect(honeypot).toBeInTheDocument();
    fireEvent.change(honeypot, { target: { value: 'http://spam-site.com' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    // Must show fake success to bot without touching database
    await waitFor(() => {
      expect(screen.getByText(/Message Received/i)).toBeInTheDocument();
    });

    // Supabase insert should NEVER have been called!
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('submits genuine contact message to database and displays confirmation', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabaseModule.supabase.from).mockReturnValue({
      insert: mockInsert,
    } as unknown as ReturnType<typeof supabaseModule.supabase.from>);

    render(
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Contact />
          </MemoryRouter>
        </QueryClientProvider>
      </HelmetProvider>
    );

    // Fill legitimate customer message
    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'Rhea Sharma' } });
    fireEvent.change(screen.getByLabelText(/Email or Phone/i), { target: { value: 'rhea@example.com' } });
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Is custom sizing available for the Solis bracelet?' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(screen.getByText(/Message Received/i)).toBeInTheDocument();
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith({
      name: 'Rhea Sharma',
      contact: 'rhea@example.com',
      message: 'Is custom sizing available for the Solis bracelet?',
    });
  });
});
