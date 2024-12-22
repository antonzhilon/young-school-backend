import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      'https://ldoxfdyekipjsakjiugv.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkb3hmZHlla2lwanNha2ppdWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3NzY4NjksImV4cCI6MjA1MDM1Mjg2OX0.Vl_RrNbEZ0stDSoaYqyfmFVZ1rhVpPjkM2JrfOzzVLg',
    );
  }

  get client() {
    return this.supabase;
  }
}
