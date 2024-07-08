import { User } from '../../users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity()
export class Organisation {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true, type: "varchar"})
    orgId: string;

    @Column({type: "varchar", length: 25})
    name: string;

    @Column({type: "text"})
    description: string;

    @ManyToMany(() => User, (user) => user.organisations)
    users: User[]
}
