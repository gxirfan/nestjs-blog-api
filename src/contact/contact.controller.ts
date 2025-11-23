import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, UsePipes, ValidationPipe, UseInterceptors } from '@nestjs/common';
import { ContactDto } from './dto/contact.dto';
import { ContactService } from './contact.service';
import { AdminGuard } from 'src/admin/guards/admin.guard';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { IContactResponse } from './interfaces/contact.response.interface';
import { ContactMapper } from './mappers/contact.mapper';

@UseGuards(AuthenticatedGuard)
@UseInterceptors(TransformInterceptor)
@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Post()
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ResponseMessage('Contact message sent successfully')
    async handleContactSubmission(@Body() data: ContactDto): Promise<IContactResponse> {
        return ContactMapper.toSingleResponseDto(await this.contactService.handleContactSubmission(data));
    }

    @UseGuards(AdminGuard)
    @Get()
    @ResponseMessage('All contact messages retrieved successfully')
    async findAll(): Promise<IContactResponse[]> {
        return ContactMapper.toResponseDto(await this.contactService.findAll());
    }

    @UseGuards(AdminGuard)
    @Get(':id')
    @ResponseMessage('Contact message retrieved successfully')
    async findOneById(@Param('id') id: string): Promise<IContactResponse> {
        return ContactMapper.toSingleResponseDto(await this.contactService.findOneById(id));
    }

    @UseGuards(AdminGuard)
    @Patch(':id')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ResponseMessage('Contact message updated successfully')
    async update(@Param('id') id: string, @Body() data: ContactDto): Promise<IContactResponse> {
        return ContactMapper.toSingleResponseDto(await this.contactService.update(id, data));
    }

    @UseGuards(AdminGuard)
    @Delete(':id')
    @ResponseMessage('Contact message deleted successfully')
    async delete(@Param('id') id: string): Promise<IContactResponse> {
        return ContactMapper.toSingleResponseDto(await this.contactService.delete(id));
    }
}
