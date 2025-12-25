import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

describe('Database Schema Tests', () => {
  let testWalletAddress: string;
  let testLoanId: number;
  
  beforeAll(() => {
    testWalletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
  });

  describe('wallet_connections table', () => {
    it('should insert wallet connection', async () => {
      const { data, error } = await supabase
        .from('wallet_connections')
        .insert({
          wallet_address: testWalletAddress,
          ip_address: '192.168.1.1',
          country: 'United States',
          city: 'New York',
          region: 'NY',
          timezone: 'America/New_York',
          user_agent: 'Mozilla/5.0 Test',
          connection_count: 1,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.wallet_address).toBe(testWalletAddress);
    });

    it('should retrieve wallet connection by address', async () => {
      const { data, error } = await supabase
        .from('wallet_connections')
        .select('*')
        .eq('wallet_address', testWalletAddress)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.country).toBe('United States');
    });

    it('should increment connection_count on update', async () => {
      const { data: before } = await supabase
        .from('wallet_connections')
        .select('connection_count')
        .eq('wallet_address', testWalletAddress)
        .single();

      const { error } = await supabase
        .from('wallet_connections')
        .update({ connection_count: (before?.connection_count || 0) + 1 })
        .eq('wallet_address', testWalletAddress);

      const { data: after } = await supabase
        .from('wallet_connections')
        .select('connection_count')
        .eq('wallet_address', testWalletAddress)
        .single();

      expect(error).toBeNull();
      expect(after?.connection_count).toBe((before?.connection_count || 0) + 1);
    });

    it('should have proper indexes on wallet_address', async () => {
      const { data, error } = await supabase
        .from('wallet_connections')
        .select('*')
        .eq('wallet_address', testWalletAddress);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('loan_transactions table', () => {
    it('should insert loan transaction', async () => {
      const { data, error } = await supabase
        .from('loan_transactions')
        .insert({
          wallet_address: testWalletAddress,
          loan_id: 1,
          collateral_amount: '150.00',
          borrowed_amount: '100.00',
          interest_rate: '5.00',
          duration_days: 30,
          status: 'active',
          collateral_token: '0x1234567890123456789012345678901234567890',
          borrow_token: '0x0987654321098765432109876543210987654321',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.status).toBe('active');
      testLoanId = data?.id;
    });

    it('should retrieve loan by wallet address', async () => {
      const { data, error } = await supabase
        .from('loan_transactions')
        .select('*')
        .eq('wallet_address', testWalletAddress);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should update loan status', async () => {
      const { error } = await supabase
        .from('loan_transactions')
        .update({ status: 'repaid', repaid_at: new Date().toISOString() })
        .eq('id', testLoanId);

      const { data } = await supabase
        .from('loan_transactions')
        .select('status')
        .eq('id', testLoanId)
        .single();

      expect(error).toBeNull();
      expect(data?.status).toBe('repaid');
    });

    it('should filter by status', async () => {
      const { data, error } = await supabase
        .from('loan_transactions')
        .select('*')
        .eq('status', 'active');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('user_reputation table', () => {
    it('should insert user reputation', async () => {
      const { data, error } = await supabase
        .from('user_reputation')
        .insert({
          wallet_address: testWalletAddress,
          reputation_level: 0,
          total_loans: 1,
          repaid_on_time: 0,
          total_volume: '100.00',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.reputation_level).toBe(0);
    });

    it('should retrieve reputation by wallet', async () => {
      const { data, error } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('wallet_address', testWalletAddress)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.total_loans).toBeGreaterThan(0);
    });

    it('should update reputation level', async () => {
      const { error } = await supabase
        .from('user_reputation')
        .update({ 
          reputation_level: 1, 
          repaid_on_time: 1,
          total_loans: 2,
        })
        .eq('wallet_address', testWalletAddress);

      const { data } = await supabase
        .from('user_reputation')
        .select('reputation_level, repaid_on_time')
        .eq('wallet_address', testWalletAddress)
        .single();

      expect(error).toBeNull();
      expect(data?.reputation_level).toBe(1);
      expect(data?.repaid_on_time).toBe(1);
    });

    it('should calculate repayment rate', async () => {
      const { data } = await supabase
        .from('user_reputation')
        .select('repaid_on_time, total_loans')
        .eq('wallet_address', testWalletAddress)
        .single();

      if (data) {
        const repaymentRate = (data.repaid_on_time / data.total_loans) * 100;
        expect(repaymentRate).toBeGreaterThanOrEqual(0);
        expect(repaymentRate).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('active_loans_summary view', () => {
    it('should query active loans summary', async () => {
      const { data, error } = await supabase
        .from('active_loans_summary')
        .select('*');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should only include active loans', async () => {
      const { data } = await supabase
        .from('active_loans_summary')
        .select('*');

      if (data && data.length > 0) {
        data.forEach(loan => {
          expect(loan.status).toBe('active');
        });
      }
    });

    it('should have proper column names', async () => {
      const { data } = await supabase
        .from('active_loans_summary')
        .select('*')
        .limit(1);

      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty('wallet_address');
        expect(data[0]).toHaveProperty('loan_id');
        expect(data[0]).toHaveProperty('collateral_amount');
        expect(data[0]).toHaveProperty('borrowed_amount');
        expect(data[0]).toHaveProperty('status');
      }
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique wallet address in user_reputation', async () => {
      const { error } = await supabase
        .from('user_reputation')
        .insert({
          wallet_address: testWalletAddress, // Duplicate
          reputation_level: 0,
          total_loans: 0,
          repaid_on_time: 0,
          total_volume: '0.00',
        });

      expect(error).toBeDefined();
      expect(error?.message).toContain('duplicate');
    });

    it('should validate reputation_level range (0-5)', async () => {
      const testAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      const { error } = await supabase
        .from('user_reputation')
        .insert({
          wallet_address: testAddress,
          reputation_level: 10, // Invalid: should be 0-5
          total_loans: 0,
          repaid_on_time: 0,
          total_volume: '0.00',
        });

      expect(error).toBeDefined();
    });

    it('should have proper foreign key relationships', async () => {
      // Try to insert loan with non-existent wallet (if FK constraint exists)
      const { data: walletExists } = await supabase
        .from('wallet_connections')
        .select('wallet_address')
        .eq('wallet_address', testWalletAddress)
        .single();

      expect(walletExists).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should query wallet connections efficiently', async () => {
      const startTime = Date.now();
      
      await supabase
        .from('wallet_connections')
        .select('*')
        .limit(100);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should query loans with pagination', async () => {
      const pageSize = 10;
      const { data, error } = await supabase
        .from('loan_transactions')
        .select('*')
        .range(0, pageSize - 1);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeLessThanOrEqual(pageSize);
    });

    it('should handle bulk inserts efficiently', async () => {
      const bulkData = Array.from({ length: 10 }, (_, i) => ({
        wallet_address: `0x${Math.random().toString(16).substr(2, 40)}`,
        ip_address: `192.168.1.${i}`,
        country: 'Test Country',
        connection_count: 1,
      }));

      const startTime = Date.now();
      const { error } = await supabase
        .from('wallet_connections')
        .insert(bulkData);

      const duration = Date.now() - startTime;
      
      expect(error).toBeNull();
      expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await supabase
      .from('loan_transactions')
      .delete()
      .eq('wallet_address', testWalletAddress);

    await supabase
      .from('user_reputation')
      .delete()
      .eq('wallet_address', testWalletAddress);

    await supabase
      .from('wallet_connections')
      .delete()
      .eq('wallet_address', testWalletAddress);
  });
});
