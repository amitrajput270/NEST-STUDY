import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fees_data')
export class FeesData {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;

    @Column({ type: 'int', nullable: true })
    sr: number;

    @Column({ type: 'date', nullable: true })
    date: Date;

    @Column({ type: 'varchar', length: 50, nullable: true })
    academic_year: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    session: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    alloted_category: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    voucher_type: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    voucher_no: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    roll_no: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    admno_uniqueid: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    status: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    fee_category: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    faculty: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    program: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    department: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    batch: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    receipt_no: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    fee_head: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    due_amount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    paid_amount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    concession_amount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    scholarship_amount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    reverse_concession_amount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    write_off_amount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    adjusted_amount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    refund_amount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    fund_trancfer_amount: number;

    @Column({ type: 'text', nullable: true })
    remarks: string;
}
