import type { Schema, Struct } from '@strapi/strapi';

export interface UtilityCta extends Struct.ComponentSchema {
  collectionName: 'components_utility_ctas';
  info: {
    description: '';
    displayName: 'CTA';
    icon: 'dashboard';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images'>;
    iconPosition: Schema.Attribute.Enumeration<['left', 'right']>;
    link: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    variant: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'outline', 'text']
    >;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'utility.cta': UtilityCta;
    }
  }
}
