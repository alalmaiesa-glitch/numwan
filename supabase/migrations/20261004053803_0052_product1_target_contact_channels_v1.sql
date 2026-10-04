update public.store_target_accounts
set public_contact_url=case domain
  when 'frost.com' then 'https://www.frost.com/about/our-locations/'
  when 'astrolabs.com' then 'https://astrolabs.com/contact-us'
  when 'kpmg.com' then 'https://kpmg.com/sa/en/about/offices.html'
  when 'pwc.com' then 'https://www.pwc.com/m1/en/content/pwc/global/forms/contactUsNew.html'
  when 'rolandberger.com' then 'https://www.rolandberger.com/en/Locations/Middle-East/Offices/'
  when 'erm.com' then 'https://www.erm.com/about/locations/united-arab-emirates/'
  when 'bureauveritas.com' then 'https://middle-east.bureauveritas.com/contact-us-atsl-bna'
  when 'strategyand.pwc.com' then 'https://www.strategyand.pwc.com/m1/en/content/pwc/global/forms/contactUsNew.html'
  when 'deloitte.com' then 'https://www.deloitte.com/middle-east/en/offices/middle-east-offices/riyadh.html'
  when 'adlittle.com' then 'https://www.adlittle.com/en/country/saudi-arabia'
  else public_contact_url
end,
status=case
  when domain in (
    'frost.com','astrolabs.com','kpmg.com','pwc.com','rolandberger.com',
    'erm.com','bureauveritas.com','strategyand.pwc.com','deloitte.com','adlittle.com'
  ) then 'CONTACT_READY'
  else status
end,
updated_at=now()
where product_id=(
  select id from public.store_products where slug='saudi-industrial-intelligence-v1'
);
