import { Organisation } from '../../organization/entities/organization.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", unique: true})
    userId: string;

    @Column({type: "varchar", length: 15,})
    firstName: string;

    @Column({type: "varchar", length: 15})
    lastName: string;

    @Column({type: "varchar", length: 50, unique: true})
    email: string;

    @Column({type: "varchar"})
    password: string;

    @Column({type: "varchar"})
    phone: string;

    @ManyToMany(() => Organisation, (organization) => organization.users)
    @JoinTable()
    organisations: Organisation[];
}
