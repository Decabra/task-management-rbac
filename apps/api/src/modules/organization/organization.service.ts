import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Organization } from '../../database/entities';
import { CreateOrganizationDto, UpdateOrganizationDto } from './organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const organization = this.organizationRepository.create(createOrganizationDto);
    return this.organizationRepository.save(organization);
  }

  async findAll(accessibleOrgIds: string[]): Promise<Organization[]> {
    return this.organizationRepository.find({
      where: { id: In(accessibleOrgIds) },
      relations: ['parent'],
    });
  }

  async findAllForAccessPermissions(): Promise<Organization[]> {
    const organizations = await this.organizationRepository.find({
      relations: ['parent'],
      order: { createdAt: 'DESC' },
    });
    
    return organizations;
  }

  async findOne(id: string, accessibleOrgIds: string[]): Promise<Organization> {
    // Check if the organization is in the accessible organizations
    if (!accessibleOrgIds.includes(id)) {
      throw new NotFoundException(`Organization with ID ${id} not found or not accessible`);
    }

    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async findOneForAccessPermissions(id: string): Promise<Organization> {
    // For Access & Permissions page, allow access to any organization
    // The RBAC guard already ensures only ADMIN and OWNER can access this endpoint
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async findChildren(parentId: string, accessibleOrgIds: string[]): Promise<Organization[]> {
    // Only return children that are in accessible organizations
    return this.organizationRepository.find({
      where: { 
        parentId,
        id: In(accessibleOrgIds)
      },
    });
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto, accessibleOrgIds: string[]): Promise<Organization> {
    const organization = await this.findOne(id, accessibleOrgIds);

    Object.assign(organization, updateOrganizationDto);

    return this.organizationRepository.save(organization);
  }

  async updateForAccessPermissions(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    // For Access & Permissions page, allow updating any organization
    // The RBAC guard already ensures only ADMIN and OWNER can access this endpoint
    const organization = await this.findOneForAccessPermissions(id);

    Object.assign(organization, updateOrganizationDto);

    return this.organizationRepository.save(organization);
  }

  async remove(id: string, accessibleOrgIds: string[]): Promise<void> {
    const organization = await this.findOne(id, accessibleOrgIds);
    await this.organizationRepository.remove(organization);
  }

  async removeForAccessPermissions(id: string): Promise<void> {
    // For Access & Permissions page, allow removing any organization
    // The RBAC guard already ensures only ADMIN and OWNER can access this endpoint
    const organization = await this.findOneForAccessPermissions(id);
    await this.organizationRepository.remove(organization);
  }

  async getHierarchy(accessibleOrgIds: string[]): Promise<Organization[]> {
    // Get all accessible organizations with their parent relationships
    const organizations = await this.organizationRepository.find({
      where: { id: In(accessibleOrgIds) },
      relations: ['parent', 'children'],
      order: { name: 'ASC' }
    });

    // Return all organizations in a flat list with hierarchy information
    return this.buildFlatHierarchy(organizations);
  }

  async getHierarchyForAccessPermissions(): Promise<Organization[]> {
    const organizations = await this.organizationRepository.find({
      relations: ['parent', 'children'],
      order: { name: 'ASC' }
    });
    return this.buildFlatHierarchy(organizations);
  }

  private buildHierarchy(organizations: Organization[]): Organization[] {
    const orgMap = new Map<string, Organization & { children: Organization[] }>();
    const roots: (Organization & { children: Organization[] })[] = [];

    // Initialize all organizations with empty children array
    organizations.forEach(org => {
      orgMap.set(org.id, { ...org, children: [] });
    });

    // Build parent-child relationships
    organizations.forEach(org => {
      const orgWithChildren = orgMap.get(org.id)!;
      
      if (org.parentId) {
        const parent = orgMap.get(org.parentId);
        if (parent) {
          parent.children.push(orgWithChildren);
        }
      } else {
        roots.push(orgWithChildren);
      }
    });

    return roots;
  }

  private buildFlatHierarchy(organizations: Organization[]): Organization[] {
    const orgMap = new Map<string, Organization>();
    const result: Organization[] = [];

    // First, create a map of all organizations
    organizations.forEach(org => {
      orgMap.set(org.id, org);
    });

    // Find root organizations (no parent)
    const roots = organizations.filter(org => !org.parentId);
    
    // Sort roots by name
    roots.sort((a, b) => a.name.localeCompare(b.name));

    // Add each root and its children recursively
    roots.forEach(root => {
      this.addOrganizationWithChildren(root, orgMap, result, 0);
    });

    return result;
  }

  private addOrganizationWithChildren(
    organization: Organization, 
    orgMap: Map<string, Organization>, 
    result: Organization[], 
    level: number
  ): void {
    // Find parent name if parentId exists
    const parentName = organization.parentId ? 
      orgMap.get(organization.parentId)?.name : undefined;
    
    // Add the current organization with level and parent name information
    const orgWithLevel = {
      ...organization,
      level: level,
      parentName: parentName
    };
    result.push(orgWithLevel);

    // Find and add children
    const children = Array.from(orgMap.values()).filter(org => org.parentId === organization.id);
    children.sort((a, b) => a.name.localeCompare(b.name));
    
    children.forEach(child => {
      this.addOrganizationWithChildren(child, orgMap, result, level + 1);
    });
  }
}
